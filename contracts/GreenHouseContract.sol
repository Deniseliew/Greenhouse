// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract GreenHouseContract {
    enum CropStatus {Available, InManufacturer, InSupplier, InSeller, ReadyForSale, Sold}

    string public companyName;
    uint public totalCrops; 
    CropStatus public currentCropStatus;

    constructor() {
        totalCrops = 0;
        currentCropStatus = CropStatus.Available;
        companyName = "GBMS";
    }

    event CropCreated(
        uint id,
        string name,
        string location,
        string cropType,
        string remarks,
        string dateOfSowing,
        string dateOfTransplant,
        string dateOfHarvest,
        uint weight,
        uint price,
        address payable owner,
        CropStatus status
    );

    event SensorDataAdded(
        uint cropId,
        string system,
        uint temperature,
        uint humidity,
        uint water,
        uint nutrition
    );

    event CropStatusUpdated(
        uint id,
        CropStatus status
    );

    struct CropDetails {
        uint id;
        string name;
        string location;
        string cropType;
        string remarks;
        string dateOfSowing;
        string dateOfTransplant;
        string dateOfHarvest;
        uint weight;
        uint price;
        address payable owner;
        CropStatus status;
    }

    struct SensorData {
        string system;
        uint temperature;
        uint humidity;
        uint water;
        uint nutrition;
    }

    mapping(uint => CropDetails) public listOfCrops;
    uint[] public cropIds;  

    // Mapping to link sensor data to a specific crop
    mapping(uint => SensorData) public cropSensorData;

    function addCrop(
        string memory _name,
        string memory _location,
        string memory _cropType,
        string memory _remarks,
        string memory _dateOfSowing,
        string memory _dateOfTransplant,
        string memory _dateOfHarvest,
        uint _weight,
        uint _price
    ) public {
        totalCrops += 1; 
        listOfCrops[totalCrops] = CropDetails(
            totalCrops,
            _name,
            _location,
            _cropType,
            _remarks,
            _dateOfSowing,
            _dateOfTransplant,
            _dateOfHarvest,
            _weight,
            _price,
            payable(msg.sender),
            CropStatus.Available
        );
        cropIds.push(totalCrops);

        emit CropCreated(
            totalCrops,
            _name,
            _location,
            _cropType,
            _remarks,
            _dateOfSowing,
            _dateOfTransplant,
            _dateOfHarvest,
            _weight,
            _price,
            payable(msg.sender),
            CropStatus.Available
        );
    }

    // Function to add sensor data to a crop
    function addSensorData(
        uint _cropId,
        string memory _system,
        uint _temperature,
        uint _humidity,
        uint _water,
        uint _nutrition
    ) public {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID"); // Ensure the ID is valid
        require(listOfCrops[_cropId].owner == msg.sender, "Only the owner can add sensor data");

        cropSensorData[_cropId] = SensorData(
            _system,
            _temperature,
            _humidity,
            _water,
            _nutrition
        );

        emit SensorDataAdded(_cropId, _system, _temperature, _humidity, _water, _nutrition);
    }

    function sendToManufacturer(uint _cropId) public {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID");
        CropDetails storage crop = listOfCrops[_cropId];
        require(crop.status == CropStatus.Available, "Crop must be available to send to manufacturer");

        crop.status = CropStatus.InManufacturer;
        emit CropStatusUpdated(_cropId, CropStatus.InManufacturer);
    }

    function sendToSupplier(uint _cropId) public {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID");
        CropDetails storage crop = listOfCrops[_cropId];
        require(crop.status == CropStatus.InManufacturer, "Crop must be in Manufacturer to send to Supplier");

        crop.status = CropStatus.InSupplier;
        emit CropStatusUpdated(_cropId, CropStatus.InSupplier);
    }

    function sendToSeller(uint _cropId) public {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID");
        CropDetails storage crop = listOfCrops[_cropId];
        require(crop.status == CropStatus.InSupplier, "Crop must be in Supplier to send to Seller");

        crop.status = CropStatus.InSeller;
        emit CropStatusUpdated(_cropId, CropStatus.InSeller);
    }

    function markReadyForSale(uint _cropId) public {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID");
        CropDetails storage crop = listOfCrops[_cropId];
        require(crop.status == CropStatus.InSeller, "Crop must be in Seller to mark as ready for sale");

        crop.status = CropStatus.ReadyForSale;
        emit CropStatusUpdated(_cropId, CropStatus.ReadyForSale);
    }

    function markAsSold(uint _cropId) public {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID");
        CropDetails storage crop = listOfCrops[_cropId];
        require(crop.status == CropStatus.ReadyForSale, "Crop must be Ready For Sale to be sold");

        crop.status = CropStatus.Sold;
        emit CropStatusUpdated(_cropId, CropStatus.Sold);
    }

    function getCropDetails(uint _id) public view returns (
        uint,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint,
        uint,
        address,
        CropStatus
    ) {
        require(_id > 0 && _id <= totalCrops, "Invalid crop ID");
        CropDetails memory crop = listOfCrops[_id];
        return (
            crop.id,
            crop.name,
            crop.location,
            crop.cropType,
            crop.remarks,
            crop.dateOfSowing,
            crop.dateOfTransplant,
            crop.dateOfHarvest,
            crop.weight,
            crop.price,
            crop.owner,
            crop.status
        );
    }

    function getSensorData(uint _cropId) public view returns (
        string memory,
        uint,
        uint,
        uint,
        uint
    ) {
        require(_cropId > 0 && _cropId <= totalCrops, "Invalid crop ID");
        SensorData memory sensor = cropSensorData[_cropId];
        return (
            sensor.system,
            sensor.temperature,
            sensor.humidity,
            sensor.water,
            sensor.nutrition
        );
    }

    function getAllCropIds() public view returns (uint[] memory) {
        return cropIds;
    }
}
