pipeline {

    agent none

    environment {
        APP_NAME = "lab10monitoreo"
        VERSION = "1.0.${BUILD_NUMBER}"
        REPO_URL = "https://github.com/lesantivanez/lab10monitoreo.git"
        BRANCH = "main"
    }

    stages {

        stage('Checkout') {
            agent any
            steps {
                echo "Clonando repositorio..."
                git branch: "${BRANCH}", url: "${REPO_URL}"
            }
        }

        stage('Install & Test (Node)') {
            agent {
                docker {
                    image 'node:18'
                    args '-u root:root'
                }
            }
            steps {
                echo "Instalando dependencias..."
                sh 'npm install'

                echo "Ejecutando pruebas Jest..."
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            agent any
            steps {
                echo "Construyendo imagen Docker..."
                sh "docker build -t ${APP_NAME}:${VERSION} ."
                sh "docker tag ${APP_NAME}:${VERSION} ${APP_NAME}:latest"
            }
        }

        stage('Deploy (Docker Compose)') {
            agent any
            steps {
                echo "Desplegando aplicación..."
                sh 'docker compose down || true'
                sh "APP_VERSION=${VERSION} docker compose up -d --build"
            }
        }

        stage('Health Check') {
            agent any
            steps {
                echo "Validando aplicación..."
                sh """
                sleep 5
                curl -f http://localhost:3000 || exit 1
                """
            }
        }

        stage('DORA Metrics') {
            agent any
            steps {
                script {
                    echo "📊 Métricas DORA"
                    echo "Deployment Frequency: ${BUILD_NUMBER}"
                    echo "Lead Time: Simulado"
                    echo "MTTR: Simulado"
                    echo "Change Failure Rate: Simulado"
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deploy exitoso - Version ${VERSION}"
        }
        failure {
            echo "❌ Fallo en pipeline"
        }
        always {
            echo "🧹 Limpieza opcional"
            sh 'docker image prune -f || true'
        }
    }
}