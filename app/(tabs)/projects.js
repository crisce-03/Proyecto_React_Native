import { Platform } from "react-native";
import ProjectsNative from "./projects.native";
import ProjectsWeb from "./projects.web";

export default Platform.OS === "web" ? ProjectsWeb : ProjectsNative;
