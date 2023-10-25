const express = require("express");
const database = require("../db/connection");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

// Create a new dog and associate it with a logged in user => user id/signup
router.post("/:id/signup", verifyToken, (req, res) => {
  const { name, breeds, gender, age, size, is_neutered } = req.body;
  const userId = req.params.id;
  const loggedInUserId = req.user_id;
  console.log('user:', 'req.user_id(token id):', req.user_id, ', req.params.id:', userId);
  
  if (Number(userId) !== loggedInUserId) {
    return res.status(403).json({ error: "You're not authorized to modify the user" });
  }

  if (!name || !breeds || !gender || !age || !size || !is_neutered || !userId) {
    return res.status(400).json({ error: "Please provide all of the info" });
  }

  // Check if breed exists in the breeds table
  database.query("SELECT id FROM breeds WHERE name = $1", [breeds], (error, result) => {
    if (error) {
      console.error("Error checking breed:", error);
      return res.status(500).json({ error: "Failed to create dog" });
    }

    let breedId = result.rows[0] ? result.rows[0].id : null;

    // If the breed does not exist, insert it into the breeds table
    if (!breedId) {
      database.query(
        "INSERT INTO breeds (name) VALUES ($1) RETURNING id",
        [breeds],
        (error, result) => {
          if (error) {
            console.error("Error creating breed:", error);
            return res.status(500).json({ error: "Failed to create dog" });
          }

          breedId = result.rows[0].id; // Use the newly created breed's ID

          // Insert the dog into the dogs table
          database.query(
            "INSERT INTO dogs (name, gender, age, size, is_neutered, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [name, gender, age, size, is_neutered, userId],
            (error, result) => {
              if (error) {
                console.error("Error creating dog:", error);
                return res.status(500).json({ error: "Failed to create dog" });
              }

              const dogId = result.rows[0].id;

              // Insert the dog's breed into the dogs_breeds table
              database.query(
                "INSERT INTO dogs_breeds (dog_id, breed_id) VALUES ($1, $2)",
                [dogId, breedId],
                (error, result) => {
                  if (error) {
                    console.error("Error creating dog-breed association:", error);
                    return res.status(500).json({ error: "Failed to create dog" });
                  }

                  res.json({
                    message: "Dog created successfully",
                    dogName: name
                    //dogId: dogId,
                  });
                }
              );
            }
          );
        }
      );
    } else {
      // If the breed exists, insert the dog into the dogs table
      database.query(
        "INSERT INTO dogs (name, gender, age, size, is_neutered, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [name, gender, age, size, is_neutered, userId],
        (error, result) => {
          if (error) {
            console.error("Error creating dog:", error);
            return res.status(500).json({ error: "Failed to create dog" });
          }

          const dogId = result.rows[0].id;

          // Insert the dog's breed into the dogs_breeds table
          database.query(
            "INSERT INTO dogs_breeds (dog_id, breed_id) VALUES ($1, $2)",
            [dogId, breedId],
            (error, result) => {
              if (error) {
                console.error("Error creating dog-breed association:", error);
                return res.status(500).json({ error: "Failed to create dog" });
              }

              res.json({
                message: "Dog created successfully",
                dogId: dogId,
              });
            }
          );
        }
      );
    }
  });
});


// Add traits to a dog's profile => dog id/traits
router.post("/:id/traits", verifyToken, (req, res) => {
  const { traits } = req.body; // Assuming traits is an array of trait IDs
  const dogId = req.params.id;

  if (!traits || !dogId) {
    return res.status(400).json({ error: "Please provide the required information" });
  }

  // Check if the dog with the given ID exists
  database.query("SELECT * FROM dogs WHERE id = $1", [dogId], (error, result) => {
    if (error) {
      console.error("Error checking dog:", error);
      return res.status(500).json({ error: "Failed to add traits" });
    }

    const dog = result.rows[0];

    if (!dog) {
      return res.status(404).json({ error: "Dog not found" });
    }

    // Insert the selected traits into the dogs_traits table
    const insertQueries = traits.map((traitId) => {
      return database.query(
        "INSERT INTO dogs_traits (dog_id, trait_id) VALUES ($1, $2)",
        [dogId, traitId]
      );
    });

    // Execute all the insert queries in parallel
    Promise.all(insertQueries)
      .then(() => {
        res.json({
          message: "Traits added successfully to the dog's profile",
          dogId
        });
      })
      .catch((error) => {
        console.error("Error adding traits:", error);
        res.status(500).json({ error: "Failed to add traits" });
      });
  });
});

module.exports = router;
