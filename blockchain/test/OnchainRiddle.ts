import { expect } from "chai";
import { ethers } from "hardhat";
import { OnchainRiddle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("OnchainRiddle", function () {
    let onchainRiddle: OnchainRiddle;
    let bot: SignerWithAddress;
    let player1: SignerWithAddress;
    let player2: SignerWithAddress;

    // Test riddles with their answers
    const testRiddle = "What has keys but no locks?";
    const correctAnswer = "keyboard";
    const wrongAnswer = "piano";

    // Helper function to hash answer
    const hashAnswer = (answer: string) => {
        return ethers.keccak256(ethers.toUtf8Bytes(answer));
    };

    beforeEach(async function () {
        [bot, player1, player2] = await ethers.getSigners();
        
        const OnchainRiddle = await ethers.getContractFactory("OnchainRiddle");
        onchainRiddle = await OnchainRiddle.deploy();
        await onchainRiddle.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right bot", async function () {
            expect(await onchainRiddle.bot()).to.equal(bot.address);
        });

        it("Should start with no active riddle", async function () {
            expect(await onchainRiddle.isActive()).to.equal(false);
            expect(await onchainRiddle.riddle()).to.equal("");
            expect(await onchainRiddle.winner()).to.equal(ethers.ZeroAddress);
        });
    });

    describe("Setting Riddles", function () {
        it("Should allow bot to set a riddle", async function () {
            const answerHash = hashAnswer(correctAnswer);
            
            await expect(onchainRiddle.setRiddle(testRiddle, answerHash))
                .to.emit(onchainRiddle, "RiddleSet")
                .withArgs(testRiddle);

            expect(await onchainRiddle.riddle()).to.equal(testRiddle);
            expect(await onchainRiddle.isActive()).to.equal(true);
            expect(await onchainRiddle.winner()).to.equal(ethers.ZeroAddress);
        });

        it("Should not allow non-bot to set a riddle", async function () {
            const answerHash = hashAnswer(correctAnswer);
            
            await expect(
                onchainRiddle.connect(player1).setRiddle(testRiddle, answerHash)
            ).to.be.revertedWith("Only bot can call this function");
        });

        it("Should not allow setting a new riddle when one is active", async function () {
            const answerHash = hashAnswer(correctAnswer);
            await onchainRiddle.setRiddle(testRiddle, answerHash);
            
            await expect(
                onchainRiddle.setRiddle("Another riddle", hashAnswer("answer"))
            ).to.be.revertedWith("Riddle already active");
        });
    });

    describe("Submitting Answers", function () {
        beforeEach(async function () {
            const answerHash = hashAnswer(correctAnswer);
            await onchainRiddle.setRiddle(testRiddle, answerHash);
        });

        it("Should accept correct answer and declare winner", async function () {
            await expect(onchainRiddle.connect(player1).submitAnswer(correctAnswer))
                .to.emit(onchainRiddle, "Winner")
                .withArgs(player1.address)
                .and.to.emit(onchainRiddle, "AnswerAttempt")
                .withArgs(player1.address, true);

            expect(await onchainRiddle.winner()).to.equal(player1.address);
            expect(await onchainRiddle.isActive()).to.equal(false);
        });

        it("Should reject wrong answer", async function () {
            await expect(onchainRiddle.connect(player1).submitAnswer(wrongAnswer))
                .to.emit(onchainRiddle, "AnswerAttempt")
                .withArgs(player1.address, false)
                .and.to.not.emit(onchainRiddle, "Winner");

            expect(await onchainRiddle.winner()).to.equal(ethers.ZeroAddress);
            expect(await onchainRiddle.isActive()).to.equal(true);
        });

        it("Should not allow submissions when no riddle is active", async function () {
            // Solve the current riddle first
            await onchainRiddle.connect(player1).submitAnswer(correctAnswer);

            // Try to submit again
            await expect(
                onchainRiddle.connect(player2).submitAnswer("answer")
            ).to.be.revertedWith("No active riddle");
        });

        it("Should not allow submissions after riddle is solved", async function () {
            await onchainRiddle.connect(player1).submitAnswer(correctAnswer);

            await expect(
                onchainRiddle.connect(player2).submitAnswer(correctAnswer)
            ).to.be.revertedWith("No active riddle");
        });

        it("Should handle case-sensitive answers", async function () {
            // Submit with different case
            await expect(onchainRiddle.connect(player1).submitAnswer("KEYBOARD"))
                .to.emit(onchainRiddle, "AnswerAttempt")
                .withArgs(player1.address, false);

            // Still active because answer was wrong
            expect(await onchainRiddle.isActive()).to.equal(true);
        });
    });

    describe("Complete Flow", function () {
        it("Should handle multiple riddles correctly", async function () {
            // First riddle
            const answer1 = "keyboard";
            await onchainRiddle.setRiddle("First riddle", hashAnswer(answer1));
            expect(await onchainRiddle.isActive()).to.equal(true);

            // Wrong attempts
            await onchainRiddle.connect(player2).submitAnswer("wrong");
            expect(await onchainRiddle.winner()).to.equal(ethers.ZeroAddress);

            // Player 1 solves it
            await onchainRiddle.connect(player1).submitAnswer(answer1);
            expect(await onchainRiddle.winner()).to.equal(player1.address);
            expect(await onchainRiddle.isActive()).to.equal(false);

            // Second riddle
            const answer2 = "echo";
            await onchainRiddle.setRiddle("Second riddle", hashAnswer(answer2));
            expect(await onchainRiddle.isActive()).to.equal(true);
            expect(await onchainRiddle.winner()).to.equal(ethers.ZeroAddress);

            // Player 2 solves it
            await onchainRiddle.connect(player2).submitAnswer(answer2);
            expect(await onchainRiddle.winner()).to.equal(player2.address);
        });
    });
});