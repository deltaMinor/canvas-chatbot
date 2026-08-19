class Cursor:
    def __init__(self, initial_x: int = 0, initial_y: int = 0, margin: int = 30):
        self.x: int = initial_x
        self.y: int = initial_y
        self.margin: int = margin

    def get_position(self):
        return self.x, self.y

    def add_margin_top(self):
        self.y += self.margin

    def add_margin_left(self):
        self.x += self.margin

    def move_right(self, change):
        self.x += change + self.margin

    def move_left(self, change):
        self.x -= change + self.margin

    def move_down(self, change):
        self.y += change + self.margin

    def move_up(self, change):
        self.y -= change + self.margin

    def set_x(self, x):
        self.x = x

    def set_y(self, y):
        self.y = y
