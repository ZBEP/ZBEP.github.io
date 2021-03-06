var contract_abi = [
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "num",
				"type": "uint32"
			},
			{
				"internalType": "bytes3",
				"name": "color",
				"type": "bytes3"
			}
		],
		"name": "doPaint",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "block_number",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "cursor",
				"type": "uint32"
			},
			{
				"internalType": "uint32",
				"name": "howMany",
				"type": "uint32"
			}
		],
		"name": "get_Pole_",
		"outputs": [
			{
				"internalType": "bytes3[]",
				"name": "_pole",
				"type": "bytes3[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pole",
		"outputs": [
			{
				"internalType": "bytes3",
				"name": "",
				"type": "bytes3"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];