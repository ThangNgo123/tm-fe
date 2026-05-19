import { GoogleLogin } from "@react-oauth/google";

export default function HomePage() {
  return (
    <div className="page">
      <h1>Welcome to Home Page</h1>
      <div>
        <h1>Google Login</h1>

        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log(credentialResponse);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>
    </div>
  );
}
