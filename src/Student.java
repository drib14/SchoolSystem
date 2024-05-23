import javax.swing.JOptionPane;

public class Student {
    private String id;
    private String firstName;
    private String lastName;
    private String age;
    private String grade;
    private String email;
    private String course;
    private double midterm;
    private double finals;

    public Student(String id, String firstName, String lastName, String age, String grade, String email, String course,
            double midterm, double finals) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.grade = grade;
        this.email = email;
        this.course = course;
        this.midterm = midterm;
        this.finals = finals;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getAge() {
        return age;
    }

    public String getGrade() {
        return grade;
    }

    public String getEmail() {
        return email;
    }

    public String getCourse() {
        return course;
    }

    public double getMidterm() {
        return midterm;
    }

    public double getFinals() {
        return finals;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public void setMidterm(double midterm) {
        this.midterm = midterm;
    }

    public void setFinals(double finals) {
        this.finals = finals;
    }

    public double getGeneralAverage() {
        return (midterm + finals) / 2;
    }

    public String getRemarks() {
        if (getGeneralAverage() <= 0) {
            JOptionPane.showMessageDialog(null, "Invalid Grade!", "GRADE ERROR!!!", JOptionPane.ERROR_MESSAGE);
        }
        return getGeneralAverage() <= 3.0 ? "PASSED" : "FAILED";
    }
}
