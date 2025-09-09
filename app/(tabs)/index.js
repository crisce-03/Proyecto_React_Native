import { Platform } from "react-native";
import IndexNative from "./index.native";
import IndexWeb from "./index.web";

// Expo Router exige un archivo sin extensión.
// Elegimos qué renderizar en runtime:
export default Platform.OS === "web" ? IndexWeb : IndexNative;
