// ssh_client.h - Header file (declarations)
#pragma once
#include <string>

class SSHClient {
public:
    // Constructor - creates SSH client with config
    SSHClient(const std::string& host,
              int port,
              const std::string& username,
              const std::string& password);

    // Connect to VxWorks
    bool connect();

    // Download a file
    std::string downloadFile(const std::string& remotePath);

    // Disconnect
    void disconnect();

private:
    std::string host_;      // 192.168.1.100
    int port_;              // 22
    std::string username_;  // admin
    std::string password_;  // your_password
    void* sshSession_;      // Internal SSH connection
};