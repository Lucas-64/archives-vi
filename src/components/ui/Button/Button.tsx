import { Spinner, StyledButton } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

export function Button({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel = "Loading",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <StyledButton
      $loading={loading}
      $size={size}
      $variant={variant}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? (
        <>
          <Spinner aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
}
