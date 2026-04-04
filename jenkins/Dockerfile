FROM jenkins/jenkins:lts

USER root

# Instalar docker CLI y dependencias
RUN apt-get update && apt-get install -y \
    docker.io \
    curl \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Instalar docker-compose v1 (clásico)
RUN curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# Agregar jenkins al grupo docker (mismo GID que el host)
RUN groupadd -g 999 docker || true
RUN usermod -aG docker jenkins

USER jenkins

# Opcional: verificar versiones
# RUN docker --version
# RUN docker-compose --version