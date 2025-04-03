
def selectedEnv = ''
def templateMap = [:]
def selectedEnvs = ''

pipeline {
    agent any
    parameters {
        gitParameter branchFilter: 'origin/(.*)', defaultValue: 'main', name: 'BRANCH', type: 'PT_BRANCH'
    }
    environment {
        DOCKER_IMAGE_NAME = "eribyteofficial/erinet"
    }
    stages {
        stage("Checkout from github repo"){
            steps{
                git  branch: "${params.BRANCH}", url: 'https://github.com/EribyteVT/erinet.git'

                script{
                    envConfigJson = readJSON file: "deployEnvs.json"

                }
            }
        }

        
        stage('Build Docker Image') {
            steps {
                script {
                    def assetPrefix = environ == "stage" 
                        ? "https://stage.eri.bot" 
                        : "https://eri.bot"
                    
                    sh "export NEXT_PUBLIC_ASSET_PREFIX=${assetPrefix}"
                    
                    

                    app = docker.build(DOCKER_IMAGE_NAME, "--build-arg NEXT_PUBLIC_ASSET_PREFIX=${assetPrefix} --build-arg ASSET_PREFIX=${assetPrefix}")
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker_hub_login') {
                        app.push("${env.BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
        }
        stage('DeployToProduction') {
            steps {
                script{

                    for (envVars in envConfigJson.configs){
                        echo "value: $envVars" 
                        templateMap.put(envVars.env, envVars.templateParams)
                    }

                    echo environ

                    String k8sObjectFile = readFile("./deployment.yaml")
                    int i = 0
                    for(def key in templateMap.get(environ).keySet()){
                        def value = String.valueOf(templateMap.get(environ).get(key))

                        k8sObjectFile = k8sObjectFile.replaceAll(/\$\{$key\}/ ,value)

                        echo "$key: $value"
                    }

                    echo "$k8sObjectFile"

                    writeFile file:'./k8s_generated.yaml', text: k8sObjectFile
                }




                withCredentials([string(credentialsId: 'CA_CERTIFICATE', variable: 'cert'),
                                 string(credentialsId: 'Kuubernetes_creds_id', variable: 'cred'),
                                 string(credentialsId: 'kubernetes_server_url', variable: 'url')]) {

                    kubeconfig(caCertificate: "${cert}", credentialsId: "${cred}", serverUrl: "${url}"){
                        sh 'kubectl apply -f k8s_generated.yaml'
                        sh "kubectl rollout restart deployment erinet-$environ"
                    }
                }

            }
        }
    }
}