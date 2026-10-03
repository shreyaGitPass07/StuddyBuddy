import CollegeAssignment from "../models/Assignments.js";


// 1️⃣ CREATE Assignment
export const createAssignment = async (req, res) => {
  try {
    const { studentEmail, topic, description, lastDate } = req.body;

    // validation
    if (!studentEmail || !topic || !lastDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const assignment = await CollegeAssignment.create({
      studentEmail,
      topic,
      description,
      lastDate,
    });

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// 2️⃣ GET Assignments by Student Email
export const getAssignments = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const assignments = await CollegeAssignment.find({
      studentEmail: email,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: assignments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// 3️⃣ DELETE Assignment (using _id)
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CollegeAssignment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// 4️⃣ UPDATE Assignment (using _id)
export const updateAssignment = async (req, res) => {
    try {
      const { id } = req.params;
  
      // remove undefined fields
      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });
  
      const updated = await CollegeAssignment.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
  
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Assignment updated successfully",
        data: updated,
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

  export const getAssignmentStats = async (req, res) => {
    try {
      const { studentEmail } = req.params;
  
      // total assignments
      const total = await CollegeAssignment.countDocuments({ studentEmail });
  
      // pending
      const pending = await CollegeAssignment.countDocuments({
        studentEmail,
        status: "pending"
      });
  
      // completed
      const completed = await CollegeAssignment.countDocuments({
        studentEmail,
        status: "completed"
      });
  
      res.status(200).json({
        success: true,
        data: {
          total,
          pending,
          completed
        }
      });
  
    } catch (e) {
      res.status(500).json({
        success: false,
        message: "Server Error"
      });
    }
  };