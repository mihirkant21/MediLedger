// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalRecords {
    struct DocumentRecord {
        bytes32 documentHash;
        address owner;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(bytes32 => DocumentRecord) public records;
    mapping(address => bytes32[]) public userDocuments;
    
    event DocumentRegistered(bytes32 indexed documentHash, address indexed owner, uint256 timestamp);
    event DocumentVerified(bytes32 indexed documentHash, bool isValid);
    
    /**
     * @dev Register a new document hash
     * @param _documentHash The hash of the document
     */
    function registerDocument(bytes32 _documentHash) public {
        require(!records[_documentHash].exists, "Document already registered");
        
        records[_documentHash] = DocumentRecord({
            documentHash: _documentHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        userDocuments[msg.sender].push(_documentHash);
        
        emit DocumentRegistered(_documentHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify if a document exists and is valid
     * @param _documentHash The hash to verify
     */
    function verifyDocument(bytes32 _documentHash) public view returns (bool, address, uint256) {
        DocumentRecord memory record = records[_documentHash];
        return (record.exists, record.owner, record.timestamp);
    }
    
    /**
     * @dev Get all documents for a user
     * @param _owner The owner's address
     */
    function getUserDocuments(address _owner) public view returns (bytes32[] memory) {
        return userDocuments[_owner];
    }
    
    /**
     * @dev Get document details
     * @param _documentHash The document hash
     */
    function getDocumentDetails(bytes32 _documentHash) public view returns (DocumentRecord memory) {
        require(records[_documentHash].exists, "Document not found");
        return records[_documentHash];
    }
}
