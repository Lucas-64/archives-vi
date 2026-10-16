import styled from "styled-components";

import { campoBase } from "../Input/Input.styles";

export const StyledTextarea = styled.textarea<{ $invalid: boolean }>`
  ${campoBase}
  min-height: 120px;
  resize: vertical;
`;
