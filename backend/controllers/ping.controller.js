class PingController {
  reply(_req, res) {
    res.json({ message: 'pong' });
  }
}

export default new PingController();
