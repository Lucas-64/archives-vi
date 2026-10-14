"use client";

import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.8; }
`;

export interface SkeletonProps {
  height?: string;
  width?: string;
  radius?: "sm" | "md" | "lg" | "xl";
}

// Loading placeholder. Keep its size equal to the final content to avoid layout shift.
export function Skeleton({ height = "16px", width = "100%", radius = "md" }: SkeletonProps) {
  return (
    <Block
      aria-hidden="true"
      $height={height}
      $width={width}
      $radius={radius}
    />
  );
}

const Block = styled.div<{ $height: string; $width: string; $radius: string }>`
  height: ${({ $height }) => $height};
  width: ${({ $width }) => $width};
  border-radius: ${({ $radius, theme }) => theme.borderRadius[$radius as "md"]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
