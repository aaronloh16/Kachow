import { DarkTheme as NavigationDarkTheme } from "@react-navigation/native";

export const MyDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: 'black',
        card: '#111',
        text: 'white',
        border: '#222',
        primary: '#f44336'
    }
}