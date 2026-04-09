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

        stage('Build Docker Image') {
            steps {
                echo "🐳 Construyendo imagen Docker..."

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
                            echo "📂 Contenido de /app:"
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
                echo "🔎 Validando archivo prometheus.yml..."

                sh """
                if [ ! -f app/prometheus_config/prometheus.yml ]; then
                    echo "❌ ERROR: prometheus.yml NO encontrado"
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

                echo "🚀 Desplegando Node + Prometheus + Grafana..."

                dir('app') {

                    sh """
                    echo "📍 Ubicación actual:"
                    pwd

                    echo "📂 Contenido app/:"
                    ls -la

                    echo "📂 Contenido prometheus_config/:"
                    ls -la prometheus_config

                    echo "🧹 Limpiando contenedores previos..."

                    docker-compose down -v || true

                    docker rm -f prometheus || true
                    docker rm -f grafana || true
                    docker rm -f node_app || true

                    docker volume prune -f || true

                    echo "🚀 Levantando stack..."

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

                echo "📦 Node:"
                docker ps --filter "name=node_app"

                echo "📦 Prometheus:"
                docker ps --filter "name=prometheus"

                echo "📦 Grafana:"
                docker ps --filter "name=grafana"
                """
            }
        }

        stage('Verify Prometheus Inside Container') {
            steps {

                echo "🔎 Verificando archivos dentro de Prometheus..."

                sh """
                docker exec prometheus ls -la /etc/prometheus || true
                """
            }
        }

        stage('Check App Health') {
            steps {

                echo "💚 Verificando healthcheck..."

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
            echo "🎉 Pipeline completado correctamente!"
            echo "Node.js + Prometheus + Grafana corriendo."
        }

        failure {
            echo "❌ Pipeline falló — revisar logs."
        }

    }
}