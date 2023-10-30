import { useNavigation } from "@react-navigation/core";
import React from "react";
import { View, Text, ImageBackground, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/userProfileStyles.js"
import NavBar from "../components/NavBar.js";
import {dogProfiles, getUserProfile } from "../dummyData/dummyData.js";
import useAuth from "../hooks/useAuth.js";
// import { disconnectUser } from "../hooks/useChatClientDev.js";
import { useChatContext } from "stream-chat-react-native-core";




const UserProfileScreen = () => {

  const { client } = useChatContext

  const disconnectUser = async () => {
    await client.disconnectUser();
  };

  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  

  const signOut = () => {
    disconnectUser();
    navigation.navigate("GetStarted");
    setUser('');
  }
 
  return (
    <SafeAreaView style={styles.flex}>
      
      <NavBar />
      <ImageBackground 
        source={require("../assets/bone-pattern.png")}
        style={styles.background}
        imageStyle={{opacity: 0.3}}>

          <View style={styles.textBox}> 
            <Text style={styles.nameText}>
              {`${user.first_name} ${user.last_name}`}
            </Text>

            <View>
              <Image 
                source={{uri: user.profile_img}}
                style={styles.avatar} />
            </View>

            <View>
              <Text> {user.bio}</Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.button} >
                <Text style={styles.buttonText}> Edit Profile </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} >
                <Text 
                  style={styles.buttonText}
                  onPress={signOut}
                > Sign Out </Text>
              </TouchableOpacity>

            </View>


          </View>

      </ImageBackground>

    </SafeAreaView>
  )
};

export default UserProfileScreen