// ssh_client.cpp - Implementation
#include "ssh_client.h"
#include <libssh2.h>  // SSH library
#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

bool SSHClient::connect() {
    // STEP 1: Initialize SSH library
    libssh2_init(0);

    // STEP 2: Create a new SSH session
    sshSession_ = libssh2_session_init();
    if (!sshSession_) {
        std::cerr << "❌ Failed to create SSH session\n";
        return false;
    }

    // STEP 3: Open network connection (socket)
    int sock = socket(AF_INET, SOCK_STREAM, 0);  // Create socket

    struct sockaddr_in sin;
    sin.sin_family = AF_INET;
    sin.sin_port = htons(port_);  // Convert port to network byte order
    sin.sin_addr.s_addr = inet_addr(host_.c_str());  // Convert IP

    // Connect socket to VxWorks
    if (connect(sock, (struct sockaddr*)(&sin), sizeof(sin)) != 0) {
        std::cerr << "❌ Failed to connect to " << host_ << ":" << port_ << "\n";
        return false;
    }

    std::cout << "✅ Connected to " << host_ << ":" << port_ << "\n";

    // STEP 4: Start SSH handshake
    if (libssh2_session_handshake(sshSession_, sock) != 0) {
        std::cerr << "❌ SSH handshake failed\n";
        return false;
    }

    std::cout << "✅ SSH handshake complete\n";

    // STEP 5: Authenticate with password
    if (libssh2_userauth_password(sshSession_,
                                   username_.c_str(),
                                   password_.c_str()) != 0) {
        std::cerr << "❌ Authentication failed\n";
        return false;
    }

    std::cout << "✅ Authenticated as " << username_ << "\n";

    return true;
}