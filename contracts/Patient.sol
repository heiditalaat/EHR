// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Patient {
    mapping (address => patient) internal patients;
    mapping (address => mapping (address => uint)) internal patientToDoctor;
    
    struct patient {
        string name;
        uint8 age;
        address id;
        //hashes of file that belong to this user for display purpose
        string history;
        address[] doctor_list;
        address[] request_list;
    }
    
    modifier checkPatient(address id) {
        patient storage p = patients[id];
        //check if patient exist
        require(p.id > address(0x0));
        _;
    }
    
    function getPatientInfo() public view checkPatient(msg.sender) returns(string memory, uint8, string memory, address[] memory, address[] memory) {
        patient storage p = patients[msg.sender];
        return (p.name, p.age, p.history, p.doctor_list, p.request_list);
    }
    
    function signupPatient(string memory _name, uint8 _age) public {
        patient storage p = patients[msg.sender];
        require(!(p.id > address(0x0)));
        require((_age > 0) && (_age < 100));
        string memory initial = "";
        //add new patient to mapping
        patients[msg.sender] = patient({name:_name, age:_age, id:msg.sender, history:initial, doctor_list:new address[](0), request_list:new address[](0)});
    }
}