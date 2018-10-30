module.exports = {
    apps: [
        {
            name: "adjustico",
            script: "./server.js"
        }
    ],
    deploy: {
        production: {
            user: "ubuntu",
            host: "ec2-52-15-165-121.us-east-2.compute.amazonaws.com",
            key: "C:/Users/Or/.ssh/adjustico.pem",
            ref: "origin/master",
            repo: "git@github.com:ornuri17/Adjusti.co-MVP.git",
            path: "/home/ubuntu/adjustico",
            "post-deploy":
                "npm install && pm2 startOrRestart ecosystem.config.js"
        }
    }
};
