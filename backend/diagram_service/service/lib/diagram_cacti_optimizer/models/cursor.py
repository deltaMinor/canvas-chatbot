class Cursor:
    def __init__(self, margin: int = 30, spacing: int = 30):
        self.x: int = margin
        self.y: int = margin
        self.margin: int = margin
        self.spacing: int = spacing

    def get_position(self):
        return self.x, self.y

    def add_margin_top(self):
        self.y += self.margin

    def add_margin_left(self):
        self.x += self.margin

    def move_right(self, change=0):
        self.x += change + self.spacing

    def move_left(self, change=0):
        self.x -= change + self.spacing

    def move_down(self, change=0):
        self.y += change + self.spacing

    def move_up(self, change=0):
        self.y -= change + self.spacing

    def set_x(self, x):
        self.x = x

    def set_y(self, y):
        self.y = y

    def reset(self):
        self.x = self.margin
        self.y = self.margin
