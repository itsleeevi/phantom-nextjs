import * as web3 from "@solana/web3.js";
import React, { useEffect, useState } from "react";

import { Button, Box, Heading } from "grommet";
import { ChakraProvider } from "@chakra-ui/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState(undefined);
  const recieverWallet = "C3EteStFtwBxZC7NjmFXWt2EaZTgWrxkn3eWDLeALzW3";
  const [amount, setAmount] = useState(0.1);
  const parse = (val) => val.replace(/^\$/, "");

  const connectPhantom = async () => {
    const { solana } = window;

    if (solana) {
      await solana.connect();
      setConnected(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
      setConnection(connection);
    };
    init();
  }, []);

  const transferSol = async () => {
    const transaction = new web3.Transaction();

    const toPubkey = new web3.PublicKey(recieverWallet);

    const instruction = web3.SystemProgram.transfer({
      fromPubkey: window.solana.publicKey,
      toPubkey: toPubkey,
      lamports: amount * 1000000000,
    });

    transaction.add(instruction);
    transaction.feePayer = window.solana.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    let signed = await window.solana.signTransaction(transaction);
    let signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <ChakraProvider>
        {!connected ? (
          <Button
            primary
            label="Connect Wallet"
            onClick={() => connectPhantom()}
          />
        ) : (
          <Box direction="column" width="medium" justify="center" gap="small">
            <NumberInput
              defaultValue={0.1}
              min={0.1}
              precision={1}
              step={0.1}
              onChange={(valueString) => setAmount(parse(valueString))}
              value={amount}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Box
              border={{ color: "black", size: "large" }}
              pad="medium"
              align="center"
            >
              <Heading>{amount}</Heading>
            </Box>
            <Button primary label="Transfer" onClick={() => transferSol()} />
          </Box>
        )}
      </ChakraProvider>
    </div>
  );
}
