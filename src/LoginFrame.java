import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class LoginFrame extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;

    public LoginFrame() {
        setTitle("Login");
        setSize(300, 250);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel panel = new JPanel(null);
        add(panel);
        placeComponents(panel);

        setVisible(true);
    }

    private void placeComponents(JPanel panel) {
        JLabel usernameLabel = new JLabel("Username:");
        usernameLabel.setBounds(10, 20, 80, 25);
        panel.add(usernameLabel);

        usernameField = new JTextField(20);
        usernameField.setBounds(100, 20, 165, 25);
        panel.add(usernameField);

        JLabel passwordLabel = new JLabel("Password:");
        passwordLabel.setBounds(10, 50, 80, 25);
        panel.add(passwordLabel);

        passwordField = new JPasswordField(20);
        passwordField.setBounds(100, 50, 165, 25);
        panel.add(passwordField);

        JButton loginButton = new JButton("Login");
        int buttonWidth = 150;
        int buttonHeight = 35;
        int panelWidth = 300;
        int xPosition = (panelWidth - buttonWidth) / 2;
        loginButton.setBounds(xPosition, 80, buttonWidth, buttonHeight);

        loginButton.setBackground(new Color(77, 137, 99)); // Green
        loginButton.setForeground(Color.WHITE);
        loginButton.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));

        panel.add(loginButton);

        JButton registerButton = new JButton("Register");
        registerButton.setBounds(xPosition, 125, buttonWidth, buttonHeight);

        registerButton.setBackground(new Color(70, 130, 180)); // Blue
        registerButton.setForeground(Color.WHITE);
        registerButton.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));

        panel.add(registerButton);

        loginButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                authenticate();
            }
        });

        registerButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                new RegistrationFrame();
                dispose();
            }
        });
    }

    private void authenticate() {
        String username = usernameField.getText();
        String password = new String(passwordField.getPassword());

        if (RegistrationFrame.validateUser(username, password)) {
            JOptionPane.showMessageDialog(this, "Login successful!");
            new AdminFrame(new User(username, password)).setVisible(true);
            dispose();
        } else if (username.isEmpty()) {
            JOptionPane.showMessageDialog(null, "Username cannot be empty", "Error", JOptionPane.ERROR_MESSAGE);
        } else if (password.isEmpty()) {
            JOptionPane.showMessageDialog(null, "Password cannot be empty", "Error", JOptionPane.ERROR_MESSAGE);
        } else {
            JOptionPane.showMessageDialog(this, "Invalid username or password", "Login Failed",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
}
