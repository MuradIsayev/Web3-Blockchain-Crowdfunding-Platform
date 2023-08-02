import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { Sepolia } from "@thirdweb-dev/chains";
import App from './App'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ThirdwebProvider activeChain={Sepolia} clientId="6a87676a3dcabc5fb677bc243ecf4f54">
        <Router>
            <App />
        </Router>
    </ThirdwebProvider >
)
