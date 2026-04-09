pipeline {
    agent any

    environment {
        APP_NAME = "node_app"
        APP_VERSION = "1.0.${BUILD_NUMBER}"
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo "🔄 Clonando código..."

                checkout([$class: 'GitSCM',
                    branches: [[name: 'main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/lesantivanez/lab10monitoreo.git'
                    ]]
                ])
            }
        }

        stage('Verify Project Structure') {
            steps {

                echo "📂 Verificando estructura..."

                sh """
                echo "📍 Ubicación actual:"
                pwd

                echo "📂 Contenido raíz:"
                ls -la

                echo "📂 Contenido app/:"
                ls -la app

                echo "📂 Contenido prometheus_config/:"
                ls -la app/prometheus_config || true
                """
            }
        }

        stage('Clean Docker Environment') {
            steps {

                echo "🧹 Limpieza profunda Docker..."

                sh """
                docker-compose -f app/docker-compose.yml down -v || true

                docker rm -f prometheus || true
                docker rm -f grafana || true
                docker rm -f node_app || true

                docker volume prune -f || true
                docker system prune -f || true

                echo "📦 Contenedores actuales:"
                docker ps -a

                echo "📦 Volúmenes actuales:"
                docker volume ls
                """
            }
        }

        stage('Build Docker Image') {
            steps {

                echo "🐳 Construyendo imagen..."

                dir('app') {
                    sh """
                    docker build -t ${APP_NAME}:${APP_VERSION} .
                    """
                }
            }
        }

        stage('Run Tests') {
            steps {

                echo "🧪 Ejecutando tests..."

                dir('app') {

                    sh """
                    docker run --rm \
                        -w /app \
                        -e APP_VERSION=${APP_VERSION} \
                        ${APP_NAME}:${APP_VERSION} \
                        sh -c '
                            echo "📂 Archivos dentro del contenedor:"
                            ls -la

                            if [ ! -f package.json ]; then
                                echo "❌ package.json no encontrado"
                                exit 1
                            fi

                            npm test
                        '
                    """
                }
            }
        }

        stage('Validate Prometheus Config') {
            steps {

                echo "🔎 Validando prometheus.yml..."

                sh """
                if [ ! -f app/prometheus_config/prometheus.yml ]; then
                    echo "❌ ERROR: prometheus.yml no existe"
                    exit 1
                fi

                echo "✅ prometheus.yml encontrado"

                echo "📄 Contenido:"
                cat app/prometheus_config/prometheus.yml
                """
            }
        }

        stage('Deploy Monitoring Stack') {
            steps {

                echo "🚀 Desplegando stack..."

                dir('app') {

                    sh """
                    echo "📍 Ubicación actual:"
                    pwd

                    echo "📂 Archivos en app/:"
                    ls -la

                    echo "📂 Archivos prometheus_config/:"
                    ls -la prometheus_config

                    echo "🚀 Levantando contenedores..."

                    docker-compose up -d --build
                    """
                }
            }
        }

        stage('Verify Containers') {
            steps {

                echo "🔍 Verificando contenedores..."

                sh """
                docker ps -a

                echo "📦 node_app:"
                docker ps --filter "name=node_app"

                echo "📦 prometheus:"
                docker ps --filter "name=prometheus"

                echo "📦 grafana:"
                docker ps --filter "name=grafana"
                """
            }
        }

        stage('Verify Prometheus Config Inside Container') {
            steps {

                echo "🔎 Verificando Prometheus interno..."

                sh """
                docker exec prometheus ls -la /etc/prometheus || true
                """
            }
        }

        stage('Check App Health') {
            steps {

                echo "💚 Verificando health..."

                sh """
                docker inspect \
                  --format='{{.State.Health.Status}}' \
                  node_app \
                  || echo "No healthcheck definido"
                """
            }
        }

    }

    post {

        always {
            echo "🧹 Pipeline finalizado"
        }

        success {
            echo "🎉 Stack desplegado correctamente"
            echo "Node.js + Prometheus + Grafana activos"
        }

        failure {
            echo "❌ Pipeline falló — revisar logs"
        }

    }
}