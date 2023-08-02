// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns; // To access a campaign by its id (index) in the array campaigns (campaigns[id])

    uint256 public numberOfCampaigns = 0; // To keep track of the number of campaigns

    // To create a new campaig (creates and returns the id of the campaign)
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns]; // Creates a new campaign in the array campaigns with the id (index) of numberOfCampaigns

        // Code won't proceed further if the require condition is not met
        require(
            campaign.deadline < block.timestamp,
            "The deadline should be a date in the future"
        );

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++; // Increments the number of campaigns by 1 after a campaign is created

        return numberOfCampaigns - 1; // Returns the id of the campaign created
    }

    // Payable functions in Solidity are functions that let a smart contract accept Ether.
    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value; // The amount sent by the donator (in wei)

        // Gets the campaign with the id _id from the array campaigns and stores it in the variable campaign
        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender); // Adds the address of the donator to the array donators in the campaign
        campaign.donations.push(amount); // Adds the amount donated by the donator to the array donations in the campaign

        (bool sent, ) = payable(campaign.owner).call{value: amount}(""); // Sends the amount donated to the owner of the campaign
        // we used ',' because payable returns two values

        if (sent) {
            campaign.amountCollected += amount; // Increments the amount collected by the campaign by the amount donated
        }
    }

    // View functions only reads but doesn’t alter the state variables defined in the contract
    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        // By doing this, we are not getting the campaigns,
        // rather just creating an empty array of numberOfCampaigns size: [{}, {}, {}...]
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            // Gets the campaign with the id i from the array campaigns and stores it in the variable item

            allCampaigns[i] = item; // Adds the campaign to the array allCampaigns
        }

        return allCampaigns;
    }
}
