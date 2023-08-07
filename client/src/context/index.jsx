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
            const data = await createCampaign({args:[
                address, //owner (Who is creating this campaign)
                form.title, 
                form.description,
                form.target,
                new Date(form.deadline).getTime(),
                form.image
                ]});

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

    return (
        <StateContext.Provider 
            value={{ 
                address, 
                contract, 
                createCampaign: publishCampaign, 
                connect,
                getCampaigns
            }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);