import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableCellRenderer;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.Random;

public class AdminFrame extends JFrame {
    private DefaultTableModel tableModel;
    private JTable studentTable;
    private User currentUser;
    private ArrayList<Student> storedStudentInfo;

    public AdminFrame(User user) {

        this.currentUser = user;
        this.storedStudentInfo = new ArrayList<>();

        setTitle("Admin Panel");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        tableModel = new DefaultTableModel();
        tableModel.addColumn("Email");
        tableModel.addColumn("ID");
        tableModel.addColumn("First Name");
        tableModel.addColumn("Last Name");
        tableModel.addColumn("Year Level");
        tableModel.addColumn("Age");
        tableModel.addColumn("Course");
        tableModel.addColumn("Midterm");
        tableModel.addColumn("Finals");
        tableModel.addColumn("General Average");
        tableModel.addColumn("Remarks");

        studentTable = new JTable(tableModel) {
            @Override
            public Component prepareRenderer(TableCellRenderer renderer, int row, int column) {
                Component comp = super.prepareRenderer(renderer, row, column);
                if (column == 10) { // Remarks column
                    String value = (String) getModel().getValueAt(row, column);
                    if ("FAILED".equals(value)) {
                        comp.setForeground(Color.RED);
                    } else if ("PASSED".equals(value)) {
                        comp.setForeground(Color.GREEN);
                    } else {
                        comp.setForeground(Color.BLACK);
                    }
                } else {
                    comp.setForeground(Color.BLACK);
                }
                return comp;
            }
        };
        JScrollPane scrollPane = new JScrollPane(studentTable);
        add(scrollPane, BorderLayout.CENTER);

        JPanel inputPanel = new JPanel(new GridLayout(0, 1, 5, 5));
        inputPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        add(inputPanel, BorderLayout.WEST);

        addButtons(inputPanel);
        updateTable();

        setVisible(true);
    }

    private void addButtons(JPanel panel) {
        JButton addButton = new JButton("Add Student");
        JButton deleteButton = new JButton("Delete Info");
        JButton updateButton = new JButton("Update Student");
        JButton logoutButton = new JButton("Logout");

        Font buttonFont = new Font("Arial", Font.BOLD, 14);

        // Set font for each button
        addButton.setFont(buttonFont);
        deleteButton.setFont(buttonFont);
        updateButton.setFont(buttonFont);
        logoutButton.setFont(buttonFont);

        // Set foreground color for each button
        addButton.setForeground(Color.WHITE);
        deleteButton.setForeground(Color.WHITE);
        updateButton.setForeground(Color.WHITE);
        logoutButton.setForeground(Color.WHITE);

        // Set background color for each button
        addButton.setBackground(new Color(0, 128, 0)); // Dark green
        deleteButton.setBackground(new Color(0, 0, 255)); // Blue
        updateButton.setBackground(new Color(255, 165, 0)); // Orange
        logoutButton.setBackground(new Color(255, 0, 0)); // Red

        panel.add(addButton);
        panel.add(deleteButton);
        panel.add(updateButton);
        panel.add(logoutButton);

        addButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                showForm("Add Student");
            }
        });

        deleteButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int selectedIndex = studentTable.getSelectedRow();
                if (selectedIndex != -1) {
                    updateStudent(selectedIndex);
                } else {
                    JOptionPane.showMessageDialog(AdminFrame.this, "Please select a student to delete information");
                }
            }
        });

        updateButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int selectedIndex = studentTable.getSelectedRow();
                if (selectedIndex != -1) {
                    updateStudent(selectedIndex);
                } else {
                    JOptionPane.showMessageDialog(AdminFrame.this, "Please select a student to update");
                }
            }
        });

        logoutButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int option = JOptionPane.showConfirmDialog(AdminFrame.this,
                        "Are you sure you want to logout?", "Confirm Logout",
                        JOptionPane.YES_NO_OPTION);
                if (option == JOptionPane.YES_OPTION) {
                    dispose();
                    new LoginFrame().setVisible(true); // Show the login frame
                }
            }
        });
    }

    private void storeStudentInformation() {
        storedStudentInfo.addAll(currentUser.getStudents());
    }

    private void showForm(String action) {
        JPanel formPanel = new JPanel(new GridLayout(0, 2, 5, 5));
        formPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        JTextField emailField = new JTextField();
        JTextField firstNameField = new JTextField();
        JTextField lastNameField = new JTextField();
        JTextField ageField = new JTextField();
        JComboBox<String> yearLevelBox = new JComboBox<>(new String[] { "Freshman", "Sophomore", "Junior", "Senior" });
        JComboBox<String> courseBox = new JComboBox<>(new String[] { "Computer Science", "Engineering", "Mathematics",
                "Physics", "Information Technology", "Computer Engineering", "Medical" });
        JTextField midtermField = new JTextField();
        JTextField finalsField = new JTextField();

        formPanel.add(new JLabel("Email:"));
        formPanel.add(emailField);
        formPanel.add(new JLabel("First Name:"));
        formPanel.add(firstNameField);
        formPanel.add(new JLabel("Last Name:"));
        formPanel.add(lastNameField);
        formPanel.add(new JLabel("Age:"));
        formPanel.add(ageField);
        formPanel.add(new JLabel("Year Level:"));
        formPanel.add(yearLevelBox);
        formPanel.add(new JLabel("Course:"));
        formPanel.add(courseBox);
        formPanel.add(new JLabel("Midterm Grade:"));
        formPanel.add(midtermField);
        formPanel.add(new JLabel("Finals Grade:"));
        formPanel.add(finalsField);

        int option = JOptionPane.showConfirmDialog(AdminFrame.this, formPanel, action, JOptionPane.OK_CANCEL_OPTION);
        if (option == JOptionPane.OK_OPTION) {
            Random random = new Random();
            String id = "" + (1000 + random.nextInt(9000));

            Student student = new Student(id, firstNameField.getText(), lastNameField.getText(),
                    ageField.getText(), (String) yearLevelBox.getSelectedItem(), emailField.getText(),
                    (String) courseBox.getSelectedItem(),
                    Double.parseDouble(midtermField.getText()), Double.parseDouble(finalsField.getText()));

            currentUser.addStudent(student);
            updateTable();
        }
    }

    private void updateStudent(int selectedIndex) {
        Student selectedStudent = currentUser.getStudents().get(selectedIndex);

        JPanel formPanel = new JPanel(new GridLayout(0, 2, 5, 5));
        formPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        JTextField emailField = new JTextField(selectedStudent.getEmail());
        JTextField firstNameField = new JTextField(selectedStudent.getFirstName());
        JTextField lastNameField = new JTextField(selectedStudent.getLastName());
        JTextField ageField = new JTextField(selectedStudent.getAge());
        JComboBox<String> yearLevelBox = new JComboBox<>(new String[] { "Freshman", "Sophomore", "Junior", "Senior" });
        yearLevelBox.setSelectedItem(selectedStudent.getGrade());
        JComboBox<String> courseBox = new JComboBox<>(new String[] { "Computer Science", "Engineering", "Mathematics",
                "Physics", "Information Technology", "Computer Engineering", "Medical" });
        courseBox.setSelectedItem(selectedStudent.getCourse());
        JTextField midtermField = new JTextField(String.valueOf(selectedStudent.getMidterm()));
        JTextField finalsField = new JTextField(String.valueOf(selectedStudent.getFinals()));

        formPanel.add(new JLabel("Email:"));
        formPanel.add(emailField);
        formPanel.add(new JLabel("First Name:"));
        formPanel.add(firstNameField);
        formPanel.add(new JLabel("Last Name:"));
        formPanel.add(lastNameField);
        formPanel.add(new JLabel("Age:"));
        formPanel.add(ageField);
        formPanel.add(new JLabel("Year Level:"));
        formPanel.add(yearLevelBox);
        formPanel.add(new JLabel("Course:"));
        formPanel.add(courseBox);
        formPanel.add(new JLabel("Midterm Grade:"));
        formPanel.add(midtermField);
        formPanel.add(new JLabel("Finals Grade:"));
        formPanel.add(finalsField);

        int option = JOptionPane.showConfirmDialog(AdminFrame.this, formPanel, "Update Student",
                JOptionPane.OK_CANCEL_OPTION);
        if (option == JOptionPane.OK_OPTION) {
            selectedStudent.setEmail(emailField.getText());
            selectedStudent.setFirstName(firstNameField.getText());
            selectedStudent.setLastName(lastNameField.getText());
            selectedStudent.setAge(ageField.getText());
            selectedStudent.setGrade((String) yearLevelBox.getSelectedItem());
            selectedStudent.setCourse((String) courseBox.getSelectedItem());
            selectedStudent.setMidterm(Double.parseDouble(midtermField.getText()));
            selectedStudent.setFinals(Double.parseDouble(finalsField.getText()));

            updateTable();
        }
    }

    private void deleteStudentInfo() {
        tableModel.setRowCount(0);
        storedStudentInfo.clear();

        for (Student student : currentUser.getStudents()) {
            storedStudentInfo.add(student);
            tableModel.addRow(new Object[] {
                    student.getEmail(),
                    student.getId(),
                    student.getFirstName(),
                    student.getLastName(),
                    student.getGrade(),
                    student.getAge(),
                    student.getCourse(),
                    student.getMidterm(),
                    student.getFinals(),
                    student.getGeneralAverage(),
                    student.getRemarks()
            });
        }
        storeStudentInformation();
    }

    private void updateTable() {
        tableModel.setRowCount(0);
        storedStudentInfo.clear();

        for (Student student : currentUser.getStudents()) {
            storedStudentInfo.add(student);
            tableModel.addRow(new Object[] {
                    student.getEmail(),
                    student.getId(),
                    student.getFirstName(),
                    student.getLastName(),
                    student.getGrade(),
                    student.getAge(),
                    student.getCourse(),
                    student.getMidterm(),
                    student.getFinals(),
                    student.getGeneralAverage(),
                    student.getRemarks()
            });
        }
        storeStudentInformation();
    }
}
