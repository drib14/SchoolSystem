import java.util.ArrayList;
import java.util.List;

public class User {
    private String username;
    private String password;
    private List<Student> students;

    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.students = new ArrayList<>();
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public List<Student> getStudents() {
        return students;
    }

    public void addStudent(Student student) {
        students.add(student);
    }

    public void removeStudent(int index) {
        students.remove(index);
    }

    public void updateStudent(int index, Student student) {
        students.set(index, student);
    }

    public void clearStudents() {
        students.clear();
    }
}
