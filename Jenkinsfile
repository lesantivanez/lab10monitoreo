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
                echo "🔄 Clonando repositorio..."

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

                echo "📂 Verificando estructura del proyecto..."

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

        stage('Deep Clean Docker (Fix Prometheus Volume Bug)') {
            steps {

                echo "🧹 Limpieza profunda Docker..."

                sh """
                echo "Deteniendo stack previo..."

                docker-compose -f app/docker-compose.yml down -v || true

                echo "Eliminando contenedores..."

                docker rm -f prometheus || true
                docker rm -f grafana || true
                docker rm -f node_app || true

                echo "Eliminando volúmenes..."

                docker volume prune -f || true

                echo "Limpieza profunda del sistema Docker..."

                docker system prune -af --volumes || true

                echo "Estado actual de Docker:"
                docker ps -a
                docker volume ls
                """
            }
        }

        stage('Build Docker Image') {
            steps {

                echo "🐳 Construyendo imagen Node.js..."

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
                            echo "📂 Contenido del contenedor:"
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

                echo "🚀 Desplegando stack completo..."

                dir('app') {

                    sh """
                    echo "📍 Ubicación actual:"
                    pwd

                    echo "📂 Contenido actual:"
                    ls -la

                    echo "📂 Contenido prometheus_config:"
                    ls -la prometheus_config

                    echo "🚀 Levantando contenedores..."

                    docker-compose up -d --build
                    """
                }
            }
        }

        stage('Verify Containers Running') {
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

        stage('Verify Prometheus Files') {
            steps {

                echo "🔎 Verificando archivos dentro de Prometheus..."

                sh """
                docker exec prometheus ls -la /etc/prometheus || true
                """
            }
        }

        stage('Check App Health') {
            steps {

                echo "💚 Verificando estado de la app..."

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
            echo "🎉 Stack Node.js + Prometheus + Grafana funcionando"
        }

        failure {
            echo "❌ Pipeline falló — revisar logs"
        }

    }
}