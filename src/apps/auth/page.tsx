import { useState } from "react";
import {
  Container,
  Paper,
  Stack,
  Text,
  Title,
  Box,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import { GoogleLogin } from "@react-oauth/google";
import { IconClipboardList } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/service/function/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  const [isLoading, setIsLoadingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log("Google login successful:", credentialResponse);
      setIsLoadingLocal(true);
      setError(null);
      setLoading(true);

      // Extract the JWT token from Google response
      const googleToken = credentialResponse.credential;

      // Call backend login API with Google token
      const response = await authService.login({ token: googleToken });

      // Update auth store with tokens and user data
      login(response.accessToken, response.user, response.refreshToken);

      // Redirect to home page
      navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);

      // Extract error message from different error types
      let errorMessage = "Login failed. Please try again.";

      if (err?.response) {
        // Ky HTTPError with response
        try {
          const errorData = await err.response.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch {
          errorMessage = `Error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err?.message) {
        // Standard Error object
        errorMessage = err.message;
      } else if (typeof err === "string") {
        // String error
        errorMessage = err;
      }

      setError(errorMessage);
      setLoading(false);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    setError("Google login failed. Please try again.");
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container
        size="xs"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          radius="xl"
          p={50}
          withBorder
          shadow="xl"
          style={{ width: "100%", maxWidth: 450, backgroundColor: "#fff" }}
        >
          <Stack gap={32} align="center">
            {/* Header Section */}
            <Stack gap={12} align="center">
              <ThemeIcon
                size={64}
                radius="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "purple", deg: 45 }}
              >
                <IconClipboardList size={32} />
              </ThemeIcon>

              <Stack gap={8} align="center">
                <Title order={2} size="h1" fw={700}>
                  Welcome Back
                </Title>
                <Text
                  color="dimmed"
                  size="md"
                  ta="center"
                  style={{ maxWidth: 300 }}
                >
                  Sign in to Task Management and start managing your projects
                  effortlessly
                </Text>
              </Stack>
            </Stack>

            {/* Error Message */}
            {error && (
              <Box
                p="md"
                style={{
                  backgroundColor: "#ffe0e0",
                  borderRadius: "8px",
                  borderLeft: "4px solid #ff6b6b",
                }}
              >
                <Text size="sm" c="red">
                  {error}
                </Text>
              </Box>
            )}

            {/* Google Login Button */}
            <Box
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? "none" : "auto",
              }}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              )}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
