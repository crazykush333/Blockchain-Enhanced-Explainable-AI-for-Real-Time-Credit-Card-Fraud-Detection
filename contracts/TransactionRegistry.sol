// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TransactionRegistry
 * @dev Store fraud detection transaction hashes on-chain
 */
contract TransactionRegistry {
    
    struct TransactionRecord {
        string transactionHash;
        uint256 amount;
        uint8 status; // 0=pending, 1=approved, 2=flagged, 3=blocked
        uint256 timestamp;
        address submittedBy;
    }
    
    // Mapping from transaction hash to record
    mapping(string => TransactionRecord) public transactions;
    
    // Array to keep track of all transaction hashes
    string[] public transactionHashes;
    
    // Events
    event TransactionStored(
        string indexed transactionHash,
        uint256 amount,
        uint8 status,
        uint256 timestamp,
        address indexed submittedBy
    );
    
    /**
     * @dev Store a transaction hash with metadata
     * @param _txHash The transaction hash from fraud detection system
     * @param _amount The transaction amount in paise (1 rupee = 100 paise)
     * @param _status Status code (0-3)
     */
    function storeTransaction(
        string memory _txHash,
        uint256 _amount,
        uint8 _status
    ) public payable {
        require(bytes(_txHash).length > 0, "Transaction hash cannot be empty");
        require(_status <= 3, "Invalid status code");
        
        // Only store if not already stored (prevent duplicates)
        if (bytes(transactions[_txHash].transactionHash).length == 0) {
            transactions[_txHash] = TransactionRecord({
                transactionHash: _txHash,
                amount: _amount,
                status: _status,
                timestamp: block.timestamp,
                submittedBy: msg.sender
            });
            
            transactionHashes.push(_txHash);
            
            emit TransactionStored(_txHash, _amount, _status, block.timestamp, msg.sender);
        }
    }
    
    /**
     * @dev Store multiple transactions in one call (gas efficient)
     */
    function storeBatchTransactions(
        string[] memory _txHashes,
        uint256[] memory _amounts,
        uint8[] memory _statuses
    ) public payable {
        require(
            _txHashes.length == _amounts.length && _amounts.length == _statuses.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < _txHashes.length; i++) {
            storeTransaction(_txHashes[i], _amounts[i], _statuses[i]);
        }
    }
    
    /**
     * @dev Get transaction record by hash
     */
    function getTransaction(string memory _txHash) 
        public 
        view 
        returns (
            string memory transactionHash,
            uint256 amount,
            uint8 status,
            uint256 timestamp,
            address submittedBy
        ) 
    {
        TransactionRecord memory record = transactions[_txHash];
        return (
            record.transactionHash,
            record.amount,
            record.status,
            record.timestamp,
            record.submittedBy
        );
    }
    
    /**
     * @dev Get total number of transactions stored
     */
    function getTransactionCount() public view returns (uint256) {
        return transactionHashes.length;
    }
    
    /**
     * @dev Get transaction hash by index
     */
    function getTransactionHashByIndex(uint256 index) public view returns (string memory) {
        require(index < transactionHashes.length, "Index out of bounds");
        return transactionHashes[index];
    }
}
