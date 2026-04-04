FROM jenkins/jenkins:lts

USER root

# Instalar docker CLI
RUN apt-get update && apt-get install -y docker.io

# Agregar jenkins al grupo docker (mismo GID que el host)
RUN groupadd -g 999 docker || true
RUN usermod -aG docker jenkins

USER jenkins