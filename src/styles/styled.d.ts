import "styled-components";
import { theme } from "./theme";

type ThemeType = typeof theme;

declare module "styled-components" {
  // Declaration merging is the documented way to type the theme for Styled Components.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}