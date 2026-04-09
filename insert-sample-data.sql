-- Sample Data for DailyIntan

-- Insert Member
INSERT INTO public.members (name, team, gen, role, avatar)
VALUES ('Intan', 'Team T', '10th Gen', 'Member', 'https://ui-avatars.com/api/?name=Intan&background=random');

-- Insert Milestones
INSERT INTO public.milestones (icon, title, val, sub) VALUES 
('Theater', 'Total Show', '150', 'Sejak debut'),
('Star', 'Total Event', '45', 'Termasuk MnG, dll'),
('Award', 'Penghargaan', '3', 'Tahun ini');

-- Insert History (Sample Shows and Events)
INSERT INTO public.history (date, category, name, venue) VALUES 
('2024-03-10', 'show', 'Aturan Anti Cinta', 'JKT48 Theater'),
('2024-03-05', 'event', 'Meet and Greet', 'Lippo Mall'),
('2024-02-28', 'show', 'Tunas di Balik Seragam', 'JKT48 Theater'),
('2024-02-14', 'event', 'Valentine Event', 'JKT48 Theater'),
('2023-12-25', 'show', 'Christmas Special Show', 'JKT48 Theater'),
('2023-11-10', 'show', 'Aturan Anti Cinta', 'JKT48 Theater'),
('2023-10-01', 'event', 'Handshake Festival', 'Mabest');
