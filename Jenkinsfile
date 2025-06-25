pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-docker-registry'
        IMAGE_NAME = 'chat-app'
        FRONTEND_TAG = "${env.BRANCH_NAME}-frontend"
        BACKEND_TAG = "${env.BRANCH_NAME}-backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/KhalidEssam/Chating-app.git'
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}-frontend:${FRONTEND_TAG}")
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}-backend:${BACKEND_TAG}", "-f backend/Dockerfile .")
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    // Add your test commands here
                    // For example:
                    // docker.run("${IMAGE_NAME}-backend:${BACKEND_TAG}", "npm test")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials-id',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    script {
                        sh '''
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            docker push ${FRONTEND_IMAGE}:${FRONTEND_TAG}
                            docker push ${BACKEND_IMAGE}:${BACKEND_TAG}
                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Deploy to your environment
                    // Example for Kubernetes:
                    // kubectl apply -f deployment.yaml
                    // 
                    // Example for Docker Compose:
                    // docker-compose up -d
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Send notification
        }
    }
}
