FROM jenkins/jenkins:lts

USER root

# Instalar Docker CLI
RUN apt update && \
    apt install -y docker.io

# Permitir que Jenkins use Docker
RUN usermod -aG docker jenkins

USER jenkins