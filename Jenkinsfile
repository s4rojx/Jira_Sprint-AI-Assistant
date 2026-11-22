pipeline {
    agent any
    environment {
        IMAGE_NAME = 'sprint-assistant'
        IMAGE_TAG  = "${BUILD_NUMBER}"
        K8S_NS     = 'sprint-assistant'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true).trim()
                }
            }
        }
        stage('Build & Test') {
            steps { sh 'mvn clean test -B' }
            post { always { junit '**/target/surefire-reports/*.xml' } }
        }
        stage('Package') {
            steps { sh 'mvn package -DskipTests -B' }
        }
        stage('Docker Build') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    docker.build("${IMAGE_NAME}:latest")
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh "minikube image load ${IMAGE_NAME}:${IMAGE_TAG}"
                sh """
                    kubectl apply -f kubernetes/namespace.yaml
                    kubectl apply -f kubernetes/secret.yaml -n ${K8S_NS}
                    kubectl apply -f kubernetes/deployment.yaml -n ${K8S_NS}
                    kubectl apply -f kubernetes/service.yaml -n ${K8S_NS}
                    kubectl set image deployment/sprint-assistant \
                        sprint-assistant=${IMAGE_NAME}:${IMAGE_TAG} -n ${K8S_NS}
                    kubectl rollout status deployment/sprint-assistant \
                        -n ${K8S_NS} --timeout=5m
                """
            }
        }
        stage('Smoke Test') {
            steps {
                sh """
                    POD=\$(kubectl get pod -l app=sprint-assistant \
                          -n ${K8S_NS} -o jsonpath='{.items[0].metadata.name}')
                    kubectl exec \$POD -n ${K8S_NS} -- \
                        wget -qO- http://localhost:8080/actuator/health
                """
            }
        }
    }
    post {
        success { echo "Build ${IMAGE_TAG} deployed successfully." }
        failure { echo "Pipeline failed — check logs." }
        always  { cleanWs() }
    }
}
