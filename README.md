# 🏠 Blockchain-Based Land Registry & Property Ownership System

![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-363636?logo=solidity)
![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?logo=ethereum)
![Hardhat](https://img.shields.io/badge/Hardhat-Development-yellow)
![JavaScript](https://img.shields.io/badge/JavaScript-Testing-F7DF1E?logo=javascript&logoColor=black)
![SHA-256](https://img.shields.io/badge/SHA--256-Document%20Integrity-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A blockchain-based **Land Registry and Property Ownership Management System** developed using **Solidity, Ethereum, Hardhat, JavaScript, and SHA-256 hashing**.

The project demonstrates how blockchain technology can be used to create a transparent and tamper-resistant system for registering properties, verifying property documents, maintaining ownership records, and securely transferring property ownership.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Proposed Solution](#-proposed-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Smart Contract Functions](#-smart-contract-functions)
- [SHA-256 Document Verification](#-sha-256-document-verification)
- [Security Testing](#-security-testing)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Compile the Contract](#-compile-the-contract)
- [Run Automated Tests](#-run-automated-tests)
- [Remix IDE Testing](#-remix-ide-testing)
- [Future Scope](#-future-scope)
- [Author](#-author)

---

## 🚀 Project Overview

Traditional land registry systems rely heavily on centralized databases, paperwork, and manual verification.

This project explores the use of **blockchain technology** for managing land/property ownership records.

Property information is managed through an Ethereum smart contract, while a **SHA-256 hash** of the corresponding property document can be stored for document-integrity verification.

The system demonstrates:

- Property registration
- Property information retrieval
- Ownership management
- Ownership transfer
- Document hash storage
- Document-integrity verification
- Administrator access control
- Unauthorized-operation rejection
- Automated smart-contract testing

---

## ❗ Problem Statement

Traditional property registration systems may face problems such as:

- Manual paperwork
- Slow verification
- Centralized record management
- Difficulty verifying document integrity
- Unauthorized modification risks
- Complex ownership-history verification

A blockchain-based implementation can demonstrate how immutable transaction records and cryptographic hashes may improve transparency and integrity.

---

## 💡 Proposed Solution

The proposed system uses an **Ethereum smart contract** to manage property records.

Each property is associated with information such as:

- Property ID
- Property number
- Location/details
- Property area
- Owner
- Document hash
- Registration information

A **SHA-256 hash** generated from the property document is used as a digital fingerprint.

If the document changes, its SHA-256 hash also changes, allowing document modifications to be detected.

---

## ✨ Key Features

### 🏠 Property Registration

Authorized administrator accounts can register new properties on the blockchain.

### 👤 Ownership Management

Every registered property is associated with an Ethereum address representing its owner.

### 🔄 Ownership Transfer

Property ownership can be transferred from the existing owner to another Ethereum address.

### 🔐 Access Control

Administrative operations are protected so unauthorized accounts cannot perform restricted actions.

### 📄 Document Integrity Verification

Property documents are hashed using **SHA-256**.

The generated hash can be compared with the hash stored in the blockchain record.

### 🛡️ Duplicate Registration Protection

The smart contract prevents the same property from being registered multiple times.

### 📜 Ownership History

Ownership changes can be tracked through the smart contract/system records.

### 🧪 Automated Testing

Hardhat tests are included to verify important smart-contract operations and security conditions.

---

# 🏗️ System Architecture

```text
                    PROPERTY DOCUMENT
                           │
                           ▼
                    SHA-256 HASHING
                           │
                           ▼
                    DOCUMENT
