const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {

    let registry;
    let admin;
    let ownerA;
    let buyerB;
    let unauthorized;

    const propertyId = 1001;
    const propertyNumber = "P001";
    const location = "Demo Nagar Maharashtra";
    const area = 1200;
    const propertyType = "Residential";
    const documentHash =
        "E1B0C4809C68FD9071F139A5279EB928D5EF4CDE23FE4E102594CA27E6764934";

    beforeEach(async function () {

        [admin, ownerA, buyerB, unauthorized] =
            await ethers.getSigners();

        const LandRegistry =
            await ethers.getContractFactory("LandRegistry");

        registry =
            await LandRegistry.deploy();

        await registry.waitForDeployment();
    });

    async function registerProperty() {

        await registry.registerProperty(
            propertyId,
            propertyNumber,
            location,
            area,
            propertyType,
            ownerA.address,
            documentHash
        );
    }

    async function registerAndVerify() {

        await registerProperty();

        await registry.verifyProperty(
            propertyId
        );
    }

    // -------------------------------------------------
    // TEST 1
    // -------------------------------------------------

    it("should deploy with correct admin", async function () {

        expect(
            await registry.admin()
        ).to.equal(
            admin.address
        );
    });

    // -------------------------------------------------
    // TEST 2
    // -------------------------------------------------

    it("should allow admin to register property", async function () {

        await registerProperty();

        const property =
            await registry.getProperty(
                propertyId
            );

        expect(property.propertyId)
            .to.equal(propertyId);

        expect(property.propertyNumber)
            .to.equal(propertyNumber);

        expect(property.location)
            .to.equal(location);

        expect(property.area)
            .to.equal(area);

        expect(property.propertyType)
            .to.equal(propertyType);

        expect(property.currentOwner)
            .to.equal(ownerA.address);

        expect(property.documentHash)
            .to.equal(documentHash);

        expect(property.verified)
            .to.equal(false);
    });

    // -------------------------------------------------
    // TEST 3
    // -------------------------------------------------

    it("should reject duplicate property ID", async function () {

        await registerProperty();

        await expect(
            registry.registerProperty(
                propertyId,
                "P002",
                "Demo City",
                900,
                "Commercial",
                ownerA.address,
                "HASH002"
            )
        ).to.be.revertedWith(
            "Property ID already exists"
        );
    });

    // -------------------------------------------------
    // TEST 4
    // -------------------------------------------------

    it("should reject zero owner address", async function () {

        await expect(
            registry.registerProperty(
                propertyId,
                propertyNumber,
                location,
                area,
                propertyType,
                ethers.ZeroAddress,
                documentHash
            )
        ).to.be.revertedWith(
            "Owner cannot be zero address"
        );
    });

    // -------------------------------------------------
    // TEST 5
    // -------------------------------------------------

    it("should reject invalid area", async function () {

        await expect(
            registry.registerProperty(
                propertyId,
                propertyNumber,
                location,
                0,
                propertyType,
                ownerA.address,
                documentHash
            )
        ).to.be.revertedWith(
            "Area must be greater than zero"
        );
    });

    // -------------------------------------------------
    // TEST 6
    // -------------------------------------------------

    it("should reject unauthorized registration", async function () {

        await expect(
            registry
                .connect(unauthorized)
                .registerProperty(
                    propertyId,
                    propertyNumber,
                    location,
                    area,
                    propertyType,
                    ownerA.address,
                    documentHash
                )
        ).to.be.revertedWith(
            "Only admin can perform this action"
        );
    });

    // -------------------------------------------------
    // TEST 7
    // -------------------------------------------------

    it("should verify property by admin", async function () {

        await registerProperty();

        await registry.verifyProperty(
            propertyId
        );

        const property =
            await registry.getProperty(
                propertyId
            );

        expect(property.verified)
            .to.equal(true);

        expect(property.status)
            .to.equal(1);
    });

    // -------------------------------------------------
    // TEST 8
    // -------------------------------------------------

    it("should reject unauthorized verification", async function () {

        await registerProperty();

        await expect(
            registry
                .connect(unauthorized)
                .verifyProperty(propertyId)
        ).to.be.revertedWith(
            "Only admin can perform this action"
        );
    });

    // -------------------------------------------------
    // TEST 9
    // -------------------------------------------------

    it("should reject verification of invalid property", async function () {

        await expect(
            registry.verifyProperty(9999)
        ).to.be.revertedWith(
            "Property does not exist"
        );
    });

    // -------------------------------------------------
    // TEST 10
    // -------------------------------------------------

    it("should transfer ownership", async function () {

        await registerAndVerify();

        await registry
            .connect(ownerA)
            .transferOwnership(
                propertyId,
                buyerB.address
            );

        const property =
            await registry.getProperty(
                propertyId
            );

        expect(property.currentOwner)
            .to.equal(buyerB.address);

        expect(property.previousOwner)
            .to.equal(ownerA.address);

        expect(property.status)
            .to.equal(3);

        expect(property.lastTransferredAt)
            .to.be.greaterThan(0);
    });

    // -------------------------------------------------
    // TEST 11
    // -------------------------------------------------

    it("should reject transfer by non-owner", async function () {

        await registerAndVerify();

        await expect(
            registry
                .connect(unauthorized)
                .transferOwnership(
                    propertyId,
                    buyerB.address
                )
        ).to.be.revertedWith(
            "Caller is not the property owner"
        );
    });

    // -------------------------------------------------
    // TEST 12
    // -------------------------------------------------

    it("should reject old owner after transfer", async function () {

        await registerAndVerify();

        await registry
            .connect(ownerA)
            .transferOwnership(
                propertyId,
                buyerB.address
            );

        await expect(
            registry
                .connect(ownerA)
                .transferOwnership(
                    propertyId,
                    unauthorized.address
                )
        ).to.be.revertedWith(
            "Caller is not the property owner"
        );
    });

    // -------------------------------------------------
    // TEST 13
    // -------------------------------------------------

    it("should reject zero new owner", async function () {

        await registerAndVerify();

        await expect(
            registry
                .connect(ownerA)
                .transferOwnership(
                    propertyId,
                    ethers.ZeroAddress
                )
        ).to.be.revertedWith(
            "New owner cannot be zero address"
        );
    });

    // -------------------------------------------------
    // TEST 14
    // -------------------------------------------------

    it("should reject same owner transfer", async function () {

        await registerAndVerify();

        await expect(
            registry
                .connect(ownerA)
                .transferOwnership(
                    propertyId,
                    ownerA.address
                )
        ).to.be.revertedWith(
            "New owner must be different"
        );
    });

    // -------------------------------------------------
    // TEST 15
    // -------------------------------------------------

    it("should reject transfer of unverified property", async function () {

        await registerProperty();

        await expect(
            registry
                .connect(ownerA)
                .transferOwnership(
                    propertyId,
                    buyerB.address
                )
        ).to.be.revertedWith(
            "Property must be verified before transfer"
        );
    });

    // -------------------------------------------------
    // TEST 16
    // -------------------------------------------------

    it("should preserve ownership history", async function () {

        await registerAndVerify();

        await registry
            .connect(ownerA)
            .transferOwnership(
                propertyId,
                buyerB.address
            );

        const history =
            await registry.getOwnershipHistory(
                propertyId
            );

        expect(history.length)
            .to.equal(2);

        expect(history[0])
            .to.equal(ownerA.address);

        expect(history[1])
            .to.equal(buyerB.address);
    });

    // -------------------------------------------------
    // TEST 17
    // -------------------------------------------------

    it("should update owner property lists", async function () {

        await registerAndVerify();

        await registry
            .connect(ownerA)
            .transferOwnership(
                propertyId,
                buyerB.address
            );

        const oldOwnerProperties =
            await registry.getPropertiesByOwner(
                ownerA.address
            );

        const newOwnerProperties =
            await registry.getPropertiesByOwner(
                buyerB.address
            );

        expect(oldOwnerProperties.length)
            .to.equal(0);

        expect(newOwnerProperties.length)
            .to.equal(1);

        expect(newOwnerProperties[0])
            .to.equal(propertyId);
    });

    // -------------------------------------------------
    // TEST 18
    // -------------------------------------------------

    it("should preserve document hash", async function () {

        await registerProperty();

        const property =
            await registry.getProperty(
                propertyId
            );

        expect(property.documentHash)
            .to.equal(documentHash);
    });

    // -------------------------------------------------
    // TEST 19
    // -------------------------------------------------

    it("should emit PropertyRegistered event", async function () {

        await expect(
            registry.registerProperty(
                propertyId,
                propertyNumber,
                location,
                area,
                propertyType,
                ownerA.address,
                documentHash
            )
        ).to.emit(
            registry,
            "PropertyRegistered"
        );
    });

    // -------------------------------------------------
    // TEST 20
    // -------------------------------------------------

    it("should emit PropertyVerified event", async function () {

        await registerProperty();

        await expect(
            registry.verifyProperty(
                propertyId
            )
        ).to.emit(
            registry,
            "PropertyVerified"
        );
    });

    // -------------------------------------------------
    // TEST 21
    // -------------------------------------------------

    it("should emit OwnershipTransferred event", async function () {

        await registerAndVerify();

        await expect(
            registry
                .connect(ownerA)
                .transferOwnership(
                    propertyId,
                    buyerB.address
                )
        ).to.emit(
            registry,
            "OwnershipTransferred"
        );
    });

    // -------------------------------------------------
    // TEST 22
    // -------------------------------------------------

    it("should block transfer of disputed property", async function () {

        await registerAndVerify();

        await registry.updatePropertyStatus(
            propertyId,
            4
        );

        await expect(
            registry
                .connect(ownerA)
                .transferOwnership(
                    propertyId,
                    buyerB.address
                )
        ).to.be.revertedWith(
            "Disputed property cannot be transferred"
        );
    });

});