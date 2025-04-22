import { Dialog, DialogContent, Button, TextField, DialogTitle } from "@mui/material";
import React, { useState } from "react";

const AddEducationModal = ({ isOpen, setIsOpen, onAdd }) => {
  const [form, setForm] = useState({
    university: "",
    type: "",
    major: "",
    yearGraduated: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAdd(form);
    setForm({ university: "", type: "", major: "", yearGraduated: "" });
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogTitle>Add Education</DialogTitle>
      <DialogContent className="space-y-3">
        <TextField
          fullWidth
          name="university"
          label="University"
          value={form.university}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          name="type"
          label="Type"
          value={form.type}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          name="major"
          label="Major"
          value={form.major}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          name="yearGraduated"
          label="Year Graduated"
          value={form.yearGraduated}
          onChange={handleChange}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={handleSubmit} variant="contained">Add</Button>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEducationModal;