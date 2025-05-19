const Contribution = require('../models/Contribution');
const Member = require('../models/Member');

// @desc    Get all contributions (optionally filtered by year)
// @route   GET /api/contributions
// @access  Private
const getContributions = async (req, res) => {
  try {
    // Get year from query params or use current year if not provided
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    // Validate year
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: 'Invalid year parameter' });
    }

    const contributions = await Contribution.find({ year })
      .populate('member', 'name phone email');
      
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contributions by member and optionally by year
// @route   GET /api/contributions/member/:memberId
// @access  Private
const getContributionsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const year = req.query.year ? parseInt(req.query.year) : null;

    // Build query
    const query = { member: memberId };
    if (year) {
      if (isNaN(year) || year < 2000 || year > 2100) {
        return res.status(400).json({ message: 'Invalid year parameter' });
      }
      query.year = year;
    }

    const contributions = await Contribution.find(query)
      .populate('member', 'name phone email')
      .sort({ year: -1 });
      
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contributions by specific year
// @route   GET /api/contributions/year/:year
// @access  Private
const getContributionsByYear = async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    // Validate year
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: 'Invalid year parameter' });
    }

    const contributions = await Contribution.find({ year })
      .populate('member', 'name phone email')
      .sort({ 'member.name': 1 });

    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contribution
// @route   PUT /api/contributions/:id
// @access  Private
const updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('member', 'name phone email');

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    res.status(200).json(contribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update specific month contribution
// @route   PUT /api/contributions/member/:memberId/month/:month
// @access  Private
const updateMonthContribution = async (req, res) => {
  const { memberId, month } = req.params;
  const { amount, year } = req.body;

  // Validate month
  const validMonths = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  if (!validMonths.includes(month.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid month' });
  }

  // Validate year (use current year if not provided)
  const contributionYear = year || new Date().getFullYear();
  if (isNaN(contributionYear) || contributionYear < 2000 || contributionYear > 2100) {
    return res.status(400).json({ message: 'Invalid year parameter' });
  }

  try {
    // Find or create contribution record for specified year
    let contribution = await Contribution.findOne({
      member: memberId,
      year: contributionYear
    });

    if (!contribution) {
      const member = await Member.findById(memberId);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      contribution = await Contribution.create({
        member: memberId,
        year: contributionYear
      });
    }

    // Update the specific month
    contribution[month] = amount;
    await contribution.save();

    res.status(200).json(contribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContributions,
  getContributionsByMember,
  getContributionsByYear,
  updateContribution,
  updateMonthContribution
};