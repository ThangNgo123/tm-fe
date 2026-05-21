FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG FRONTEND_BACKEND_API_URL
ARG FRONTEND_GOOGLE_CLIENT_ID

RUN VITE_BACKEND_API_URL="$FRONTEND_BACKEND_API_URL" \
	VITE_GOOGLE_CLIENT_ID="$FRONTEND_GOOGLE_CLIENT_ID" \
	npm run build

FROM nginx:1.27-alpine AS runtime

RUN cat <<'EOF' > /etc/nginx/conf.d/default.conf
server {
	listen 80;
	server_name _;

	root /usr/share/nginx/html;
	index index.html;

	location / {
		try_files $uri $uri/ /index.html;
	}

	location = /healthz {
		access_log off;
		add_header Content-Type text/plain;
		return 200 "ok\n";
	}
}
EOF

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]