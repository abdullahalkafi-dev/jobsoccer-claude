export const diagramAnimations = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }

  @keyframes breathing-glow {
    0%, 100% {
      box-shadow: 0 0 30px 5px rgba(250, 204, 21, 0.4);
    }
    50% {
      box-shadow: 0 0 50px 15px rgba(250, 204, 21, 0.2);
    }
  }

  .animate-breathing-glow {
    animation: breathing-glow 3s ease-in-out infinite;
  }
`;
