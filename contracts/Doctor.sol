// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Doctor {
    //hash key value pair to store data on blockchain (acts as a database)
    mapping (address => doctor) internal doctors;
    mapping (address => mapping(address => uint)) internal doctorToPatient;
    
    struct doctor {
        string name;
        address id;
        //list of patients that have granted this doctor access to their records
        address[] patient_list;
    }
    
    modifier checkDoctor(address id) {
        doctor storage d = doctors[id];
        //check if doctor exist
        require(d.id > address(0x0));
        _;
    }
    
    //log in with address
    function getDoctorInfo() public view checkDoctor(msg.sender) returns(string memory, address[] memory){
        doctor storage  d = doctors[msg.sender];
        return (d.name, d.patient_list);
    }
    
    //sign up with address
    function signupDoctor(string memory _name) public {
        doctor storage d = doctors[msg.sender];
        //sign that this account belongs to a doctor
        require(keccak256(abi.encodePacked(_name)) != keccak256(""));
        //check that the addres of the user is not null
        require(!(d.id > address(0x0)));
        //add new doctor to mapping
        doctors[msg.sender] = doctor({name:_name, id:msg.sender, patient_list:new address[](0)});
    }    
    
}