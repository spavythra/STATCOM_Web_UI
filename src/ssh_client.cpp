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

std::string SSHClient::downloadFile(const std::string& remotePath) {
    // STEP 1: Open SFTP session (file transfer over SSH)
    LIBSSH2_SFTP* sftpSession = libssh2_sftp_init(sshSession_);
    if (!sftpSession) {
        std::cerr << "Failed to init SFTP\n";
        return "";
    }

    // STEP 2: Open remote file for reading
    LIBSSH2_SFTP_HANDLE* sftpHandle =
        libssh2_sftp_open(sftpSession,
                          remotePath.c_str(),
                          LIBSSH2_FXF_READ,  // Read mode
                          0);

    if (!sftpHandle) {
        std::cerr << "Failed to open file: " << remotePath << "\n";
        libssh2_sftp_shutdown(sftpSession);
        return "";
    }

    // STEP 3: Read file contents
    std::string content;
    char buffer[1024];

    while (true) {
        // Read up to 1024 bytes at a time
        int bytesRead = libssh2_sftp_read(sftpHandle, buffer, sizeof(buffer));

        if (bytesRead < 0) {
            std::cerr << "Error reading file\n";
            break;
        }

        if (bytesRead == 0) {
            // End of file reached
            break;
        }

        // Append to content string
        content.append(buffer, bytesRead);
    }

    std::cout << "✅ Downloaded " << content.size() << " bytes from "
              << remotePath << "\n";

    // STEP 4: Close file and SFTP session
    libssh2_sftp_close(sftpHandle);
    libssh2_sftp_shutdown(sftpSession);

    return content;
}

void SSHClient::disconnect() {
    std::cout << "[ssh_client.cpp] disconnect() called\n";

    if (sftpSession_) {
        libssh2_sftp_shutdown(sftpSession_);
        sftpSession_ = nullptr;
    }

    if (sshSession_) {
        libssh2_session_disconnect(sshSession_, "Normal shutdown");
        libssh2_session_free(sshSession_);
        sshSession_ = nullptr;
    }

    if (sock_ >= 0) {
        close(sock_);
        sock_ = -1;
    }

    connected_ = false;
    std::cout << "✅ [ssh_client.cpp] Disconnected\n";
}
bool SSHClient::isConnected() const {
    return connected_;
}

std::string SSHClient::getLastError() const {
    return lastError_;
}
