import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.HashMap;
import java.util.Map;

public class RegistrationFrame extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton registerButton;
    private JButton backButton;

    private static Map<String, String> credentials = new HashMap<>();

    public RegistrationFrame() {
        setTitle("Admin Registration");
        setSize(300, 250);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        add(panel);
        placeComponents(panel);

        setVisible(true);
    }

    private void placeComponents(JPanel panel) {
        panel.setLayout(null);

        JLabel userLabel = new JLabel("Username:");
        userLabel.setBounds(10, 20, 80, 25);
        panel.add(userLabel);

        usernameField = new JTextField(20);
        usernameField.setBounds(100, 20, 165, 25);
        panel.add(usernameField);

        JLabel passwordLabel = new JLabel("Password:");
        passwordLabel.setBounds(10, 50, 80, 25);
        panel.add(passwordLabel);

        passwordField = new JPasswordField(20);
        passwordField.setBounds(100, 50, 165, 25);
        panel.add(passwordField);

        registerButton = new JButton("Register");
        int buttonWidth = 150;
        int buttonHeight = 35;
        int panelWidth = 300;
        int xPosition = (panelWidth - buttonWidth) / 2;
        registerButton.setBounds(xPosition, 80, buttonWidth, buttonHeight);

        registerButton.setBackground(new Color(70, 130, 180)); // Blue
        registerButton.setForeground(Color.WHITE);
        registerButton.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));

        panel.add(registerButton);

        registerButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String username = usernameField.getText();
                String password = new String(passwordField.getPassword());

                if (username.isEmpty() && password.isEmpty()) {
                    JOptionPane.showMessageDialog(null, "Username and Password cannot be empty", "Error",
                            JOptionPane.ERROR_MESSAGE);
                } else if (username.isEmpty()) {
                    JOptionPane.showMessageDialog(null, "Username cannot be empty", "Error", JOptionPane.ERROR_MESSAGE);
                } else if (password.isEmpty()) {
                    JOptionPane.showMessageDialog(null, "Password cannot be empty", "Error", JOptionPane.ERROR_MESSAGE);
                } else if (!password.matches("[a-zA-Z0-9]{8}")) {
                    JOptionPane.showMessageDialog(null, "Password should be alphanumeric and have exactly 8 characters",
                            "Error", JOptionPane.ERROR_MESSAGE);
                } else {
                    credentials.put(username, password);
                    JOptionPane.showMessageDialog(null, "Registration successful!");
                    resetForm();
                    dispose();
                    new LoginFrame();
                }
            }
        });

        backButton = new JButton("Login");
        backButton.setBounds(xPosition, 125, buttonWidth, buttonHeight);
        backButton.setBackground(new Color(77, 137, 99)); // Red
        backButton.setForeground(Color.WHITE);
        backButton.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));
        panel.add(backButton);

        backButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dispose();
                new LoginFrame();
            }
        });
    }

    private void resetForm() {
        usernameField.setText("");
        passwordField.setText("");
    }

    public static boolean validateUser(String username, String password) {
        return credentials.containsKey(username) && credentials.get(username).equals(password);
    }
}