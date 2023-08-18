import React, { useContext, createContext } from "react";
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react'
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    // Address of the smart contract we want to connect 
    const { contract } = useContract('0x8AD98448b4d47FbAa4EDfa317cFAEad7735E64F9')
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign')

    // Connecting smart wallet
    const address = useAddress();
    const connect = useMetamask();

    // Order should be same as the order of the arguments in the smart contract function
    const publishCampaign = async (form) => {
        try {
            const data = await createCampaign({
                args: [
                    address, //owner (Who is creating this campaign)
                    form.title,
                    form.description,
                    form.target,
                    new Date(form.deadline).getTime(),
                    form.image
                ]
            });

            console.log('Contract call success', data);
        }
        catch (err) {
            console.log('Contract call failure', err);
        }
    }

    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns');

        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i,
        }));

        return parsedCampaigns;
    }

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();

        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

        return filteredCampaigns;
    }

    const donate = async (pId, amount) => {
        const data = await contract.call('donateToCampaign', pId, address, {
            value: ethers.utils.parseEther(amount),
        });

        return data;
    }

    // Get all the donations for a particular campaign 
    const getDonations = async (pId) => {
        const donations = await contract.call('getDonators', pId);
        console.log(donations);
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for (let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i], // Address of the donator 
                donation: ethers.utils.formatEther(donations[1][i].toString()), // Amount donated
            });
        }

        return parsedDonations;
    }


    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                createCampaign: publishCampaign,
                connect,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations,
            }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);