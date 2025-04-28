import { Dialog, DialogContent, Button, TextField, DialogTitle } from "@mui/material";
import React, { useState, useEffect } from "react";

const EditEducationModal = ({
  open,
  onClose,
  education,
  index,
  educationList,
  setEducationList,
  setSnackbar,
  setMessage,
  setSuccess
}) => {
  const [form, setForm] = useState(education);

  useEffect(() => {
    setForm(education);
  }, [education]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const updated = [...educationList];
    updated[index] = form;
    setEducationList(updated);
    setMessage("Successfully updated education!");
    setSuccess(true);
    setSnackbar(true);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Education</DialogTitle>
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
          <Button onClick={handleSave} variant="contained">Save</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEducationModal;